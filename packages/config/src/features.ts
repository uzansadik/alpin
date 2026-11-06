export type AppFeatures = {
  organizations: boolean;
  uploads: boolean;
  usage: boolean;
  admin: boolean;
};

export const features = {
  organizations: true,
  uploads: true,
  usage: false,
  admin: true,
} satisfies AppFeatures;
