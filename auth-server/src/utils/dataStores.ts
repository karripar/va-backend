import {
  ProfileResponse,
  ExtendedApplicationsResponse as ApplicationsResponse,
} from "va-hybrid-types/contentTypes";



export const profiles: ProfileResponse[] = [
  {
    _id: "1",
    userName: "Test User",
    email: "test@metropolia.fi",
    registeredAt: new Date().toISOString(),
    avatarUrl: "",
    favorites: ["Espanja - Madrid", "Ranska - Pariisi"],
    documents: [],
    exchangeBadge: true,
  }
];

export const applications: ApplicationsResponse[] = [];

export const budgetEstimates: Record<string, unknown[]> = {};

export const grantApplications: Record<string, unknown[]> = {};

export const erasmusGrants: Record<string, unknown[]> = {};

export const kelaSupport: Record<string, unknown> = {};
