import { authService, RegisterData } from '../services/authService';
import { User } from '../types';
import { useMutation } from './useAsync';

export function useLogin() {
  return useMutation(({ email, password }: { email: string; password: string }) =>
    authService.login(email, password).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useRegister() {
  return useMutation((data: RegisterData) =>
    authService.register(data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}

export function useChangePassword() {
  return useMutation(
    ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(currentPassword, newPassword).then(res => {
        if (!res.success) throw new Error(res.message);
        return res;
      })
  );
}

export function useUpdateProfile() {
  return useMutation((data: User) =>
    authService.updateProfile(data).then(res => {
      if (!res.success) throw new Error(res.message);
      return res.data;
    })
  );
}
