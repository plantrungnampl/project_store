// "use client";

// import { useState, ChangeEvent, FormEvent, useTransition } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Eye, EyeOff, ArrowRight, LoaderCircle } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Separator } from "@/components/ui/separator";
// import { loginSchema, LoginValues } from "@/validation";
// import { toast } from "sonner";

// interface FormData {
//   email: string;
//   password: string;
//   rememberMe: boolean;
// }

// export default function Login() {
//   // const router = useRouter();
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [formData, setFormData] = useState<FormData>({
//     email: "",
//     password: "",
//     rememberMe: false,
//   });
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const [isPending, startTransition] = useTransition();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleCheckboxChange = (checked: boolean) => {
//     setFormData((prev) => ({ ...prev, rememberMe: checked }));
//   };

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError(null);
//     startTransition(async () => {
//       const values: LoginValues = { email, password, rememberMe };
//       const { error, success } = await loginSchema(values);
//       if (error) {
//         setError(error);
//         toast("Loi");
//       } else if (success) {
//         setIsTransitioning(true);
//         setIsLoggedIn(true);
//       }
//     });
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
//           <CardDescription>
//             Enter your email and password to access your account
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="name@example.com"
//                 required
//                 value={formData.email}
//                 onChange={handleChange}
//                 disabled={isLoading}
//               />
//             </div>

//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Password</Label>
//                 <Link
//                   href="/forgot-password"
//                   className="text-sm font-medium text-blue-600 hover:text-blue-500"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>

//               <div className="relative">
//                 <Input
//                   id="password"
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="••••••••"
//                   required
//                   value={formData.password}
//                   onChange={handleChange}
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
//                   disabled={isLoading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-5 w-5" />
//                   ) : (
//                     <Eye className="h-5 w-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center space-x-2">
//               <Checkbox
//                 id="remember"
//                 checked={formData.rememberMe}
//                 onCheckedChange={handleCheckboxChange}
//                 disabled={isLoading}
//               />
//               <Label
//                 htmlFor="remember"
//                 className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//               >
//                 Remember me
//               </Label>
//             </div>

//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? (
//                 <>
//                   <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 <>
//                   Sign in
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </>
//               )}
//             </Button>
//           </form>

//           <div className="mt-4 text-center text-sm">
//             <Separator className="my-4" />
//             <p>
//               Don&apos;t have an account?{" "}
//               <Link
//                 href="/signup"
//                 className="font-medium text-blue-600 hover:text-blue-500"
//               >
//                 Sign up
//               </Link>
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
"use client";

import { useState, ChangeEvent, FormEvent, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
// import { login } from "@/app/actions"; // Giả định bạn có server action login
import { loginSchema, LoginValues } from "@/validation";
import { toast } from "sonner";
import { LoginLucia } from "./action";

export default function Login() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<LoginValues>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate form data with Zod
    const result = loginSchema.safeParse(formData);

    if (!result.success) {
      // Get the first error message
      const firstError = result.error.errors[0]?.message;
      setError(firstError);
      toast(firstError || "Invalid form data");
      return;
    }

    startTransition(async () => {
      try {
        // Call the server action with validated data
        const response = await LoginLucia(result.data);

        if (response.error) {
          setError(response.error);
          toast(response.error);
        } else if (response.success) {
          toast("Signed in successfully");

          // If redirectUrl is provided, navigate to it
          // if (response.redirectUrl) {
          //   router.push(response.redirectUrl);
          // } else {
          // Default redirect to dashboard
          router.push("/");
          // }
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("Something went wrong. Please try again.");
        toast("Login failed");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>
            Enter your email and password to access your account
          </CardDescription>
          {error && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-600">
              {error}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={handleCheckboxChange}
                disabled={isPending}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <Separator className="my-4" />
            <p>
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
