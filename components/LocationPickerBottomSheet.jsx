import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    InteractionManager,
} from 'react-native';
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import * as Location from 'expo-location';
import debounce from 'lodash.debounce';
import { getDistance } from 'geolib';
import theme from '../constants/theme';
import Button from '../components/Button';
import Loading from './Loading';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GOOGLE_PLACES_API_KEY = 'AIzaSyCdx0JZYg4-ZS9P1IFDcUhgT7XwpI4wrVQ';

const LocationPickerBottomSheet = React.forwardRef(({ onLocationSelected }, ref) => {
    const insets = useSafeAreaInsets();

    const searchRef = useRef(null);

    const [currentLocation, setCurrentLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [places, setPlaces] = useState([]);
    const [query, setQuery] = useState('');

    // Cache for query results
    const cacheRef = useRef({});
    // Ref for AbortController to cancel in-flight requests
    const abortControllerRef = useRef(null);

    // Fetch place details with cancellation support
    const getPlaceDetails = async (placeId, signal) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry&key=${GOOGLE_PLACES_API_KEY}`;
        try {
            const response = await fetch(detailsUrl, { signal });
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error fetching place details:', error);
            return null;
        }
    };

    useEffect(() => {
        const requestPermissions = async () => {
            setLoading(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Location Access Denied', 'Enable location services to see nearby places.');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });
            // Initial fetch: nearby establishments
            fetchPlaces('');
            setLoading(false);
        };

        requestPermissions();
    }, []);

    const fetchPlaces = useCallback(
        debounce(async (text) => {
            if (!currentLocation) return;
            const { latitude, longitude } = currentLocation;
            const radius = 200;

            // Use cached results if available
            if (cacheRef.current[text]) {
                InteractionManager.runAfterInteractions(() => {
                    setPlaces(cacheRef.current[text]);
                });
                setLoading(false);
                return;
            }

            // Cancel previous fetch if any
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const controller = new AbortController();
            abortControllerRef.current = controller;

            let url = '';
            if (text.length < 3) {
                // Nearby search provides full details including geometry
                url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=establishment&key=${GOOGLE_PLACES_API_KEY}`;
            } else {
                // Use autocomplete – then fetch details for each prediction.
                url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                    text
                )}&key=${GOOGLE_PLACES_API_KEY}&location=${latitude},${longitude}&radius=${radius}&types=establishment`;
            }

            try {
                const response = await fetch(url, { signal: controller.signal });
                const data = await response.json();
                let results = [];

                if (data.results) {
                    results = data.results.map((place) => ({
                        id: place.place_id,
                        name: place.name,
                        address: place.vicinity || 'No address available',
                        location: place.geometry.location,
                        distance: getDistance({ latitude, longitude }, place.geometry.location),
                    }));
                } else if (data.predictions) {
                    // Limit to first 5 predictions to reduce load
                    const predictions = data.predictions.slice(0, 5);
                    results = await Promise.all(
                        predictions.map(async (prediction) => {
                            const details = await getPlaceDetails(prediction.place_id, controller.signal);
                            if (details && details.geometry) {
                                return {
                                    id: prediction.place_id,
                                    name: details.name || prediction.structured_formatting.main_text,
                                    address:
                                        details.formatted_address ||
                                        prediction.structured_formatting.secondary_text ||
                                        'No address available',
                                    location: details.geometry.location,
                                    distance: getDistance({ latitude, longitude }, details.geometry.location),
                                };
                            }
                            return null;
                        })
                    );
                    results = results.filter(Boolean);
                }
                // Cache the result
                cacheRef.current[text] = results;
                // Use InteractionManager to defer heavy state updates until interactions settle
                InteractionManager.runAfterInteractions(() => {
                    setPlaces(results);
                });
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.log('Fetch aborted');
                } else {
                    console.error('Error fetching places:', error);
                }
            } finally {
                setLoading(false);
            }
        }, 800), // Debounce delay remains at 800ms
        [currentLocation]
    );

    const selectLocation = (place) => {
        if (!place.location) return;
        onLocationSelected({
            name: place.name,
            latitude: place.location.lat,
            longitude: place.location.lng,
            address: place.address,
        });
        ref.current?.dismiss();
    };

    return (
        <BottomSheetModal
            handleIndicatorStyle={{ backgroundColor: 'white' }}
            ref={ref}
            enableDynamicSizing={false}
            topInset={insets.top}
            index={0}
            snapPoints={['100%']}
            backdropComponent={(props) => (
                <BottomSheetBackdrop
                    {...props}
                    opacity={0.5}  // Adjust opacity for dimming effect
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    pressBehavior="close" // Closes on background tap
                />
            )}
            dismissOnBackdropPress={true} // Enables dismissal on backdrop click            
            backgroundStyle={{ backgroundColor: theme.dark.colors.background }}
            onChange={() => {
                setLoading(true);
                fetchPlaces(query);
            }}
        >
            <BottomSheetView style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.header}>Select Location</Text>
                    <Button buttonColor='transparent' title="Cancel" onPress={() => ref.current?.dismiss()} />
                </View>

                <TextInput
                    ref={searchRef}
                    style={styles.searchBar}
                    placeholder="Search for a place"
                    placeholderTextColor="#aaa"
                    onChangeText={(text) => {
                        setLoading(true);
                        setQuery(text);
                        fetchPlaces(text);
                    }}
                />

                {loading && <Loading size="large" color={theme.dark.colors.primary} />}

                <FlatList
                    data={places}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.listItem} onPress={() => selectLocation(item)}>
                            <Text style={styles.listItemTitle}>{item.name}</Text>
                            <Text style={styles.listItemDetails}>
                                {item.distance ? `Distance: ${(item.distance / 1000).toFixed(2)} km` : ''}
                                {` | ${item.address}`}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </BottomSheetView>
        </BottomSheetModal>
    );
});

const styles = StyleSheet.create({
    contentContainer: {
        flex: 1,
        padding: 16,
        backgroundColor: theme.dark.colors.background,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    searchBar: {
        height: 50,
        borderColor: theme.dark.colors.surface30,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        backgroundColor: theme.dark.colors.surface20,
        color: 'white',
        marginBottom: 10,
    },
    listItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    listItemTitle: {
        fontWeight: 'bold',
        color: 'white',
    },
    listItemDetails: {
        color: 'grey',
    },
});

export default LocationPickerBottomSheet;
