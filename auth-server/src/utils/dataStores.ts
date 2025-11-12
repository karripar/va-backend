import {
  ProfileResponse,
  ExtendedApplicationsResponse as ApplicationsResponse,
} from "va-hybrid-types/contentTypes";

// TODO: Replacing with MongoDB/PostgreSQL database

export const profiles: ProfileResponse[] = [
  {
    id: "1",
    userName: "Test User",
    email: "test@metropolia.fi",
    registeredAt: new Date().toISOString(),
    avatarUrl: "",
    favorites: ["Espanja - Madrid", "Ranska - Pariisi"],
    documents: [],
    exchangeBadge: true,
    linkedinUrl: "https://linkedin.com/in/testuser",
  }
];

export const applications: ApplicationsResponse[] = [];

export const budgetEstimates: Record<string, unknown[]> = {};

export const grantApplications: Record<string, unknown[]> = {};

export const erasmusGrants: Record<string, unknown[]> = {};

export const kelaSupport: Record<string, unknown> = {};
