export interface UserInterface {
  id: string;
  username: string;
  email: string;
  image: string | null;
  firstName?: string | null;
  lastName?: string | null;
}