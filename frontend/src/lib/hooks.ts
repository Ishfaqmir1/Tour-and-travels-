import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Lazy import ApiClient to avoid axios SSR issues (axios accesses `location` during init)
let _ApiClient: any = null;
async function getApi(): Promise<any> {
  if (!_ApiClient) {
    const mod = await import('./api-client');
    _ApiClient = mod.default;
  }
  return new _ApiClient();
}

// ── Query Key Factory ──────────────────────────────────────────────
export const queryKeys = {
  destinations: {
    all: ['destinations'] as const,
    bySlug: (slug: string) => ['destinations', slug] as const,
  },
  guides: {
    all: ['tour-guides'] as const,
    byId: (id: number | string) => ['tour-guides', id] as const,
  },
  profile: {
    me: ['profile', 'me'] as const,
    payments: ['profile', 'payments'] as const,
  },
  admin: {
    users: ['admin', 'users'] as const,
    bookings: ['admin', 'bookings'] as const,
    payments: ['admin', 'payments'] as const,
  },
};

// ── Query Hooks ────────────────────────────────────────────────────

/** Fetch all destinations */
export function useDestinations() {
  return useQuery({
    queryKey: queryKeys.destinations.all,
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getDestinations();
      if (response?.status === 'success' && Array.isArray(response?.data)) {
        return response.data;
      }
      throw new Error(response?.message || 'Failed to load destinations');
    },
  });
}

/** Fetch a single destination by slug */
export function useDestination(slug: string) {
  return useQuery({
    queryKey: queryKeys.destinations.bySlug(slug),
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getDestination(slug);
      if (response?.status === 'success' && response?.data) {
        return response.data;
      }
      throw new Error(response?.message || 'Destination not found');
    },
    enabled: !!slug,
  });
}

/** Fetch a single tour guide by id */
export function useTourGuide(id: number | string) {
  return useQuery({
    queryKey: queryKeys.guides.byId(id),
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getTourGuide(id);
      if (response?.status === 'success' && response?.data) {
        return response.data;
      }
      throw new Error(response?.message || 'Guide not found');
    },
    enabled: !!id && !Number.isNaN(Number(id)) && Number(id) > 0,
  });
}

/** Fetch current user's profile */
export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile.me,
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getMe();
      if (response?.status === 'success' && response.user) {
        return response.user;
      }
      throw new Error('Failed to load profile');
    },
    retry: 1,
  });
}

/** Fetch current user's payments */
export function useMyPayments() {
  return useQuery({
    queryKey: queryKeys.profile.payments,
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getPayments();
      if (response?.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    retry: 1,
  });
}

/** Fetch admin users list */
export function useAdminUsers() {
  return useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getAdminUsers();
      if (response?.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    enabled: false, // manually refetch when tab changes
  });
}

/** Fetch admin bookings list */
export function useAdminBookings() {
  return useQuery({
    queryKey: queryKeys.admin.bookings,
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getAdminBookings();
      if (response?.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    enabled: false,
  });
}

/** Fetch admin payments list */
export function useAdminPayments() {
  return useQuery({
    queryKey: queryKeys.admin.payments,
    queryFn: async () => {
      const api = await getApi();
      const response = await api.getAdminPayments();
      if (response?.status === 'success' && Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    },
    enabled: false,
  });
}

// ── Mutation Hooks ─────────────────────────────────────────────────

/** Submit a contact message */
export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: async ({ name, email, message }: { name: string; email: string; message: string }) => {
      const api = await getApi();
      return api.submitContactMessage(name, email, message);
    },
  });
}

/** Request a password reset code */
export function useRequestPasswordResetCode() {
  return useMutation({
    mutationFn: async (email: string) => {
      const api = await getApi();
      return api.requestPasswordResetCode(email);
    },
  });
}

/** Reset password with code */
export function useResetPassword() {
  return useMutation({
    mutationFn: async ({ email, code, password }: { email: string; code: string; password: string }) => {
      const api = await getApi();
      return api.resetPassword(email, code, password);
    },
  });
}

/** Update user profile */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, email, phone, address }: { name: string; email: string; phone?: string; address?: string }) => {
      const api = await getApi();
      return api.updateProfile(name, email, phone, address);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.me });
    },
  });
}

/** Change password */
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      const api = await getApi();
      return api.changePassword(currentPassword, newPassword);
    },
  });
}

/** Create a payment */
export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      guide_id: number;
      days: number;
      name_on_card: string;
      card_number: string;
      expiry: string;
      cvv: string;
    }) => {
      const api = await getApi();
      return api.createPayment(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.payments });
    },
  });
}
