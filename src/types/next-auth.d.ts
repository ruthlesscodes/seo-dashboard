import "next-auth";

declare module "next-auth" {
  interface User {
    seoApiKey?: string;
    seoOrgId?: string;
    seoPlan?: string;
    seoDomain?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      seoApiKey?: string;
      seoOrgId?: string;
      seoPlan?: string;
      seoDomain?: string;
    };
  }
}
