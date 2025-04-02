import { Dimensions } from "react-native";

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

import { Asset } from 'expo-asset';

export const invalidProfileImage = require("../assets/images/missingProfileImage.jpg");

const girls = [
    require('../assets/images/girl/girl-1.jpg'),
    require('../assets/images/girl/girl-2.jpg'),
    require('../assets/images/girl/girl-3.jpg'),
    require('../assets/images/girl/girl-4.jpg'),
    require('../assets/images/girl/girl-5.jpg'),
    require('../assets/images/girl/girl-6.jpg'),
];

const boys = [
    require('../assets/images/boy/boy-1.jpg'),
    require('../assets/images/boy/boy-2.jpg'),
];

const genders = [
    require("../assets/images/gender/male.png"),
    require("../assets/images/gender/female.png"),
    require("../assets/images/gender/other.png"),
];

function convertToDate(obj) {
    // Create a new object with the underscore-prefixed properties trimmed
    const cleanedObj = Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key.replace(/^_/, ''), value])
    );

    // Destructure the cleaned object into seconds and nanoseconds
    const { seconds, nanoseconds } = cleanedObj;

    // If seconds and nanoseconds are available, convert them to a Date
    if (seconds !== undefined && nanoseconds !== undefined) {
        // JavaScript Date accepts milliseconds, so we need to convert nanoseconds to milliseconds
        const milliseconds = seconds * 1000 + nanoseconds / 1000000;
        return new Date(milliseconds);
    }
    return null;
}

export const getTimeSincePost = (lastUpdateTime) => {
    if (!lastUpdateTime) return "Just now";

    const now = new Date();  // Current local time

    // Converts Firebase timestamp (UTC) to JS Date
    const lastTime = convertToDate(lastUpdateTime);
    const diffInSeconds = Math.floor((now.getTime() - lastTime.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;

    // Format date if more than 7 days ago
    const options = { month: "long", day: "numeric" };
    if (lastTime.getFullYear() !== now.getFullYear()) {
        options.year = "numeric";
    }

    return lastTime.toLocaleDateString("en-US", options);
};

export const getTimeSince = (lastUpdateTime) => {
    if (!lastUpdateTime) return "Just now";

    const now = new Date();  // Current local time
    const lastTime = lastUpdateTime.toDate();  // Converts Firebase timestamp (UTC) to JS Date

    const diffInSeconds = Math.floor((now.getTime() - lastTime.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths}m`;

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}yr`;
};

/**
 * Calculates age in years based on Firestore Timestamp.
 * @param {Object} dateOfBirthFirestore - Firestore Timestamp object with 'seconds' and 'nanoseconds' properties.
 * @returns {number} - Age in years.
 */
export const getAge = (dateOfBirthFirestore) => {
    // Convert Firestore Timestamp to JavaScript Date object
    const birthDate = convertToDate(dateOfBirthFirestore);
    const today = new Date();
    // Calculate the difference in years
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust age if the birth date hasn't occurred yet this year
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }
    return age;
}

export const getGenderIcon = (gender) => {
    switch (gender) {
        case "male":
            return genders[0];
        case "female":
            return genders[1];
        case 'other':
            return genders[2];
        default:
            return genders[2];
    }
};

export const getRandomProfilePic = async (gender) => {
    let selectedImage;

    switch (gender) {
        case "female":
            selectedImage = girls[Math.floor(Math.random() * girls.length)];
            break;
        case "male":
            selectedImage = boys[Math.floor(Math.random() * boys.length)];
            break;
        default:
            selectedImage = girls[Math.floor(Math.random() * girls.length)];
            break;
    }

    // Use Asset.fromModule() to get the URL of the selected image
    const asset = await Asset.fromModule(selectedImage);
    return asset.uri; // This will return the URL of the image
};

export const hp = percentage => {
    return (percentage * deviceHeight) / 100;
}

export const wp = percentage => {
    return (percentage * deviceWidth) / 100;
}
