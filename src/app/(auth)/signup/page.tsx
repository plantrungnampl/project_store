"use client";

import { useState } from "react";
import Link from "next/link";
// import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, LoaderCircle, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { register } from "@/app/api/auth/signup/action";
// import { RegisterFormData } from "@/validation/auth";
// import { toast } from "@/components/ui/use-toast";
import { register } from "./actions";
import { toast } from "sonner";
import { RegisterFormData } from "@/validation";
import { useRouter } from "next/navigation";

export default function Signup() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    receiveNews: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);

    // Check password strength
    if (name === "password") {
      let strength = 0;

      if (value.length >= 8) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^A-Za-z0-9]/.test(value)) strength += 1;

      setPasswordStrength(strength);
    }
  };

  const handleCheckboxChange =
    (name: keyof RegisterFormData) => (checked: boolean) => {
      setFormData((prev) => ({ ...prev, [name]: checked }));
      setFormError(null);
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    try {
      // Client-side validation of passwords matching
      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // Call the server action
      const result = await register(formData);

      if (result.error) {
        setFormError(result.error);
        toast("Registration failed");
      } else if (result.success) {
        // Show success toast before redirecting
        toast("Account created");

        // Check if redirectUrl exists before redirecting
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setFormError("Something went wrong. Please try again.");
      toast("Registration failed");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            ELEGANCE
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Premium Shopping Experience
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                {formError}
              </div>
            )}

            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="email">Email</TabsTrigger>
                <TabsTrigger value="social">Social</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        placeholder="Doe"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-500"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {/* Password strength indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Password strength</span>
                          <span
                            className={
                              passwordStrength === 0
                                ? "text-destructive"
                                : passwordStrength <= 2
                                ? "text-amber-500"
                                : "text-green-500"
                            }
                          >
                            {passwordStrength === 0
                              ? "Very weak"
                              : passwordStrength === 1
                              ? "Weak"
                              : passwordStrength === 2
                              ? "Fair"
                              : passwordStrength === 3
                              ? "Good"
                              : "Strong"}
                          </span>
                        </div>
                        <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              passwordStrength === 0
                                ? "bg-destructive w-1/5"
                                : passwordStrength === 1
                                ? "bg-amber-500 w-2/5"
                                : passwordStrength === 2
                                ? "bg-amber-500 w-3/5"
                                : passwordStrength === 3
                                ? "bg-green-500 w-4/5"
                                : "bg-green-500 w-full"
                            }`}
                          />
                        </div>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                          <li className="flex items-center">
                            <Check
                              className={`h-3 w-3 mr-1 ${
                                formData.password.length >= 8
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <span>At least 8 characters</span>
                          </li>
                          <li className="flex items-center">
                            <Check
                              className={`h-3 w-3 mr-1 ${
                                /[A-Z]/.test(formData.password)
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <span>At least 1 uppercase</span>
                          </li>
                          <li className="flex items-center">
                            <Check
                              className={`h-3 w-3 mr-1 ${
                                /[0-9]/.test(formData.password)
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <span>At least 1 number</span>
                          </li>
                          <li className="flex items-center">
                            <Check
                              className={`h-3 w-3 mr-1 ${
                                /[^A-Za-z0-9]/.test(formData.password)
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            />
                            <span>At least 1 special character</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                    </div>
                    {formData.password &&
                      formData.confirmPassword &&
                      formData.password !== formData.confirmPassword && (
                        <p className="text-xs text-destructive mt-1">
                          Passwords do not match
                        </p>
                      )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={formData.agreeTerms}
                        onCheckedChange={handleCheckboxChange("agreeTerms")}
                        required
                        disabled={isLoading}
                      />
                      <Label htmlFor="terms" className="text-sm font-normal">
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newsletter"
                        checked={formData.receiveNews}
                        onCheckedChange={handleCheckboxChange("receiveNews")}
                        disabled={isLoading}
                      />
                      <Label
                        htmlFor="newsletter"
                        className="text-sm font-normal"
                      >
                        I want to receive emails about product updates and
                        promotions
                      </Label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="social">
                <div className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                    Continue with Facebook
                  </Button>
                  <Button variant="outline" className="w-full">
                    <svg
                      className="mr-2 h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43z" />
                      <path d="M20.756 5.924c-.15.41-.465.75-.638 1.07-.56 1.04-1.1 2.69-1.1 4.34 0 .96.087 1.89.342 2.7-.3.07-.593.14-.897.14-.357 0-.675-.03-.977-.08-.37-.47-.952-.94-1.607-1.28-.904-.47-1.904-.84-3.18-.84-1.255 0-2.25.37-3.155.84-.676.34-1.273.83-1.618 1.29-.302.04-.599.07-.975.07-.301 0-.592-.07-.89-.14.263-.84.35-1.77.35-2.71 0-1.65-.54-3.3-1.1-4.34-.174-.32-.48-.66-.64-1.07.95-.3 2.207-.46 3.312-.46 1.243 0 2.438.19 3.593.53a8.722 8.722 0 0 1 3.593-.53c1.115 0 2.366.17 3.587.46z" />
                      <path d="M10.875 20.567h2.25c.167 0 .335-.02.5-.04-1.077-.73-2.152-1.97-2.152-3.72 0-1.23.865-2.76 2.4-3.48 0-.04.028-.07.028-.11.648-.31 1.096-.98 1.096-1.74 0-.82-.445-1.5-1.096-1.77l.018-.06c0-.04-.018-.08-.018-.12 0-1.82-1.96-3.63-4.275-3.63-2.343 0-4.306 1.81-4.306 3.63 0 .04-.2.08-.2.12l.032.06C4.575 10.16 4.14 10.84 4.14 11.66c0 .76.437 1.43 1.086 1.74 0 .04.037.07.037.11 1.535.72 2.4 2.24 2.4 3.48 0 1.75-1.074 2.99-2.152 3.72.166.02.334.04.502.04h2.25" />
                    </svg>
                    Continue with Apple
                  </Button>
                </div>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or with email
                    </span>
                  </div>
                </div>
                <p className="text-center text-sm">
                  By creating an account, you agree to our{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="text-center w-full text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
