import ProfileDisplay from "../../components/ProfileDisplay"
import { useAuth } from "../../context/authContext"

const profile = () => {
  const {
    user,
  } = useAuth();
  return (
    <ProfileDisplay userData={user} />
  )
}

export default profile

