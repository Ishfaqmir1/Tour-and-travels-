import axios, { AxiosInstance } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || 'http://localhost:8080';

class ApiClient {
  private client: AxiosInstance;
  private static tokenKey = 'jwt_token';
  private static userKey = 'user_data';

  get http() {
    return this.client;
  }

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config) => {
      const token = ApiClient.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const requestConfig = error.config;
          if (requestConfig?._skipGlobal401Handler) {
            return Promise.reject(error);
          }
          ApiClient.logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  static setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      // Set cookie for Next.js middleware (7 day expiry)
      document.cookie = `${this.tokenKey}=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
  }

  static getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  static removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      // Clear the cookie for middleware
      document.cookie = `${this.tokenKey}=; path=/; max-age=0; SameSite=Lax`;
    }
  }

  static setUser(user: any) {
    if (typeof window !== 'undefined') {
      // Normalize: Prisma returns isSuperAdmin, but frontend expects is_super_admin
      const normalized = { ...user };
      if ('isSuperAdmin' in normalized && !('is_super_admin' in normalized)) {
        normalized.is_super_admin = normalized.isSuperAdmin;
      }
      localStorage.setItem(this.userKey, JSON.stringify(normalized));
      // Set cookie for middleware admin checks
      const isAdmin = normalized.is_super_admin ?? normalized.isSuperAdmin ?? false;
      document.cookie = `is_super_admin=${isAdmin ? 'true' : 'false'}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
    }
  }

  static getUser(): any | null {
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem(this.userKey);
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        this.removeUser();
        return null;
      }
    }
    return null;
  }

  static removeUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.userKey);
      document.cookie = 'is_super_admin=; path=/; max-age=0; SameSite=Lax';
    }
  }

  static logout() {
    this.removeToken();
    this.removeUser();
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }

  static isSuperAdmin(): boolean {
    const user = this.getUser();
    return !!(user?.is_super_admin ?? user?.isSuperAdmin);
  }

  async login(email: string, password: string) {
    ApiClient.logout();
    const response = await this.client.post('/api/login', { email, password });
    if (response.data.status === 'success') {
      ApiClient.setToken(response.data.authorisation.token);
      ApiClient.setUser(response.data.user);
    }
    return response.data;
  }

  async register(name: string, email: string, password: string) {
    ApiClient.logout();
    const response = await this.client.post('/api/register', {
      name, email, password,
      password_confirmation: password,
    });
    if (response.data.status === 'success') {
      ApiClient.setToken(response.data.authorisation.token);
      ApiClient.setUser(response.data.user);
    }
    return response.data;
  }

  async logout() {
    const token = ApiClient.getToken();
    ApiClient.logout();
    try {
      if (token) {
        await this.client.post('/api/logout', {}, {
          headers: { Authorization: `Bearer ${token}` },
        } as any);
      }
    } catch {}
  }

  async getMe() {
    const response = await this.client.get('/api/me');
    return response.data;
  }

  async updateProfile(name: string, email: string, phone?: string, address?: string) {
    const response = await this.client.put('/api/profile', { name, email, phone, address });
    if (response.data?.status === 'success' && response.data?.user) {
      ApiClient.setUser(response.data.user);
    }
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post('/api/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
    return response.data;
  }

  async getTourGuides(params?: { location?: string; destination_slug?: string }) {
    const response = await this.client.get('/api/tour-guides', { params });
    return response.data;
  }

  async getTourGuide(id: number | string) {
    const response = await this.client.get(`/api/tour-guides/${id}`);
    return response.data;
  }

  async getDestinations() {
    const response = await this.client.get('/api/destinations');
    return response.data;
  }

  async getDestination(slug: string) {
    const response = await this.client.get(`/api/destinations/${slug}`);
    return response.data;
  }

  async createDestination(data: any) {
    const response = await this.client.post('/api/destinations', data);
    return response.data;
  }

  async updateDestination(id: number, data: any) {
    const response = await this.client.put(`/api/destinations/${id}`, data);
    return response.data;
  }

  async deleteDestination(id: number) {
    const response = await this.client.delete(`/api/destinations/${id}`);
    return response.data;
  }

  async submitContactMessage(name: string, email: string, message: string) {
    const response = await this.client.post('/api/contact-messages', { name, email, message });
    return response.data;
  }

  async requestPasswordResetCode(email: string) {
    const response = await this.client.post('/api/forgot-password', { email });
    return response.data;
  }

  async resetPassword(email: string, code: string, password: string) {
    const response = await this.client.post('/api/reset-password', {
      email, code, password, password_confirmation: password,
    });
    return response.data;
  }

  async createPayment(payload: {
    guide_id: number;
    days: number;
    name_on_card: string;
    card_number: string;
    expiry: string;
    cvv: string;
  }) {
    const response = await this.client.post('/api/payments', payload);
    return response.data;
  }

  async getPayments() {
    const response = await this.client.get('/api/payments');
    return response.data;
  }

  async getAdminUsers() {
    const response = await this.client.get('/api/admin/users');
    return response.data;
  }

  async getAdminBookings() {
    const response = await this.client.get('/api/admin/bookings');
    return response.data;
  }

  async getAdminPayments() {
    const response = await this.client.get('/api/admin/payments');
    return response.data;
  }

  // === New CRUD Methods ===

  async getPackages(params?: Record<string, any>) {
    const response = await this.client.get('/api/packages', { params });
    return response.data;
  }

  async getPackage(idOrSlug: string) {
    const response = await this.client.get(`/api/packages/${idOrSlug}`);
    return response.data;
  }

  async createPackage(data: any) {
    const response = await this.client.post('/api/packages', data);
    return response.data;
  }

  async updatePackage(id: number, data: any) {
    const response = await this.client.put(`/api/packages/${id}`, data);
    return response.data;
  }

  async deletePackage(id: number) {
    const response = await this.client.delete(`/api/packages/${id}`);
    return response.data;
  }

  async getGalleries(params?: Record<string, any>) {
    const response = await this.client.get('/api/gallery/items', { params });
    return response.data;
  }

  async getGalleryAlbums() {
    const response = await this.client.get('/api/gallery/albums');
    return response.data;
  }

  async createGalleryItem(data: any) {
    const response = await this.client.post('/api/gallery/items', data);
    return response.data;
  }

  async updateGalleryItem(id: number, data: any) {
    const response = await this.client.put(`/api/gallery/items/${id}`, data);
    return response.data;
  }

  async deleteGalleryItem(id: number) {
    const response = await this.client.delete(`/api/gallery/items/${id}`);
    return response.data;
  }

  async getHotels(params?: Record<string, any>) {
    const response = await this.client.get('/api/hotels', { params });
    return response.data;
  }

  async createHotel(data: any) {
    const response = await this.client.post('/api/hotels', data);
    return response.data;
  }

  async updateHotel(id: number, data: any) {
    const response = await this.client.put(`/api/hotels/${id}`, data);
    return response.data;
  }

  async deleteHotel(id: number) {
    const response = await this.client.delete(`/api/hotels/${id}`);
    return response.data;
  }

  async getTaxis(params?: Record<string, any>) {
    const response = await this.client.get('/api/taxis', { params });
    return response.data;
  }

  async createTaxi(data: any) {
    const response = await this.client.post('/api/taxis', data);
    return response.data;
  }

  async updateTaxi(id: number, data: any) {
    const response = await this.client.put(`/api/taxis/${id}`, data);
    return response.data;
  }

  async deleteTaxi(id: number) {
    const response = await this.client.delete(`/api/taxis/${id}`);
    return response.data;
  }

  async getTestimonials(params?: Record<string, any>) {
    const response = await this.client.get('/api/testimonials', { params });
    return response.data;
  }

  async createTestimonial(data: any) {
    const response = await this.client.post('/api/testimonials', data);
    return response.data;
  }

  async updateTestimonial(id: number, data: any) {
    const response = await this.client.put(`/api/testimonials/${id}`, data);
    return response.data;
  }

  async deleteTestimonial(id: number) {
    const response = await this.client.delete(`/api/testimonials/${id}`);
    return response.data;
  }

  async getBlogPosts(params?: Record<string, any>) {
    const response = await this.client.get('/api/blog', { params });
    return response.data;
  }

  async createBlogPost(data: any) {
    const response = await this.client.post('/api/blog', data);
    return response.data;
  }

  async updateBlogPost(id: number, data: any) {
    const response = await this.client.put(`/api/blog/${id}`, data);
    return response.data;
  }

  async deleteBlogPost(id: number) {
    const response = await this.client.delete(`/api/blog/${id}`);
    return response.data;
  }

  async getFAQs(params?: Record<string, any>) {
    const response = await this.client.get('/api/faqs', { params });
    return response.data;
  }

  async createFAQ(data: any) {
    const response = await this.client.post('/api/faqs', data);
    return response.data;
  }

  async updateFAQ(id: number, data: any) {
    const response = await this.client.put(`/api/faqs/${id}`, data);
    return response.data;
  }

  async deleteFAQ(id: number) {
    const response = await this.client.delete(`/api/faqs/${id}`);
    return response.data;
  }

  async getWebsiteSettings() {
    const response = await this.client.get('/api/website-settings');
    return response.data;
  }

  async getPublicSettings() {
    const response = await this.client.get('/api/website-settings/public');
    return response.data;
  }

  async updateWebsiteSetting(key: string, data: any) {
    const response = await this.client.put(`/api/website-settings/key/${key}`, data);
    return response.data;
  }

  async createBooking(payload: {
    package_id: number;
    user_id: number;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    travelers: number;
    travel_date: string;
    special_requests?: string;
  }) {
    const response = await this.client.post('/api/bookings', payload);
    return response.data;
  }

  async getBookings(params?: Record<string, any>) {
    const response = await this.client.get('/api/bookings', { params });
    return response.data;
  }

  async getMyBookings(userId: number) {
    const response = await this.client.get('/api/bookings', { params: { user_id: userId } });
    return response.data;
  }

  async updateBooking(id: number, data: any) {
    const response = await this.client.put(`/api/bookings/${id}`, data);
    return response.data;
  }

  async deleteBooking(id: number) {
    const response = await this.client.delete(`/api/bookings/${id}`);
    return response.data;
  }

  async getContactMessages() {
    const response = await this.client.get('/api/contact-messages');
    return response.data;
  }

  async deleteContactMessage(id: number) {
    const response = await this.client.delete(`/api/contact-messages/${id}`);
    return response.data;
  }

  async getRoles() {
    const response = await this.client.get('/api/roles');
    return response.data;
  }

  async createRole(data: any) {
    const response = await this.client.post('/api/roles', data);
    return response.data;
  }

  async updateRole(id: number, data: any) {
    const response = await this.client.put(`/api/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(id: number) {
    const response = await this.client.delete(`/api/roles/${id}`);
    return response.data;
  }

  async getUsers() {
    const response = await this.client.get('/api/admin/users');
    return response.data;
  }

  async updateUser(id: number, data: any) {
    const response = await this.client.put(`/api/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.client.delete(`/api/admin/users/${id}`);
    return response.data;
  }
}

export default ApiClient;
