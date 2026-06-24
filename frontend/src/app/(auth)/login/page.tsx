import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Hotel Management SaaS</h1>
          <p className="mt-2 text-sm text-gray-600">Admin Panel Access</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
