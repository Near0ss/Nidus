import Settings from '../../components/Perfil/Settings/Settings';
import Social from '../../components/Perfil/Social/Social';
import { useAuth } from '../../context/AuthContext';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  if (!user) return null;
  return (
    <>
      <Settings user={user} updateUser={updateUser} />
      <Social user={user} updateUser={updateUser} />
    </>
  );
}
