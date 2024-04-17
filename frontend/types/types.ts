export interface ErrorFormSignUpInterface {
  email?: string[];
  password1: string[];
  nonFieldErrors?: string[];
}

export interface ErrorFormPasswordResetInterface {
  uid?: string[];
  newPassword1?: string[];
  newPassword2?: string[];
  token?: string[];
}

export interface ErrorFormSignInInterface {
  email?: string[];
  password?: string[];
  nonFieldErrors?: string[];
}

export interface ErrorFormUpdateProfileInterface {
  email: string[];
  username: string[];
  password: string[];
  image: string[];
}

export interface UserInterface {
  id: string;
  username: string;
  email: string;
  image: string;
}

export interface LanguageInterface {
  name: string;
  code: string;
  id: number;
}

export enum AuthenticationStatus {
  Loading,
  Authenticated,
  Unauthenticated
}