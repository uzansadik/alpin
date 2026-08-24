export type AppFeatures = {
  organizations: boolean;
  billing: boolean;
  uploads: boolean;
  usage: boolean;
  admin: boolean;
};

export const features = {
  organizations: true,
  billing: false,
  uploads: true,
  usage: false,
  admin: true,
} satisfies AppFeatures;
