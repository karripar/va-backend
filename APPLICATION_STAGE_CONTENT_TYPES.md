# Application Stage Content Types

This document contains TypeScript interfaces and types that should be manually added to the content-types repository.

---

## Application Stage Status Type

```typescript
/**
 * Status of an application stage
 */
export type ApplicationStageStatus = 
  | 'not_started'
  | 'in_progress'
  | 'pending_review'
  | 'completed';
```

---

## Application Phase Type

```typescript
/**
 * Application phases
 */
export type ApplicationPhase = 
  | 'esihaku'
  | 'nomination'
  | 'apurahat'
  | 'vaihdon_jalkeen';
```

---

## Application Stage Interface

```typescript
/**
 * Application stage definition
 */
export interface ApplicationStage {
  id: string;
  phase: ApplicationPhase;
  title: string;
  description: string;
  requiredDocuments: string[];
  optionalDocuments?: string[];
  externalLinks?: ExternalLink[];
  deadline?: string; // ISO 8601 date string
  order: number;
}
```

---

## User Application Progress Interface

```typescript
/**
 * User's progress on an application stage
 */
export interface UserApplicationProgress {
  id: string;
  userId: string;
  stageId: string;
  status: ApplicationStageStatus;
  completedAt?: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
```

---

## Application Stage with Progress Interface

```typescript
/**
 * Application stage with user's progress information
 */
export interface ApplicationStageWithProgress extends ApplicationStage {
  status: ApplicationStageStatus;
  completedAt?: string; // ISO 8601 date string
}
```

---

## External Link Interface

```typescript
/**
 * External link for additional resources
 */
export interface ExternalLink {
  title: string;
  url: string;
  description?: string;
}
```

---

## Update Stage Status Request

```typescript
/**
 * Request body for updating stage status
 */
export interface UpdateStageStatusRequest {
  status: ApplicationStageStatus;
}
```

---

## Update Stage Status Response

```typescript
/**
 * Response from updating stage status
 */
export interface UpdateStageStatusResponse {
  id: string;
  phase: ApplicationPhase;
  title: string;
  description: string;
  status: ApplicationStageStatus;
  requiredDocuments: string[];
  optionalDocuments?: string[];
  deadline?: string;
  completedAt?: string;
  updatedAt: string;
}
```

---

## Stage Status Change Event

```typescript
/**
 * Event triggered when stage status changes
 */
export interface StageStatusChangeEvent {
  userId: string;
  stageId: string;
  oldStatus: ApplicationStageStatus;
  newStatus: ApplicationStageStatus;
  timestamp: string;
  triggeredBy: 'user' | 'system' | 'admin';
}
```

---

## Phase Progress Summary

```typescript
/**
 * Summary of progress for a specific phase
 */
export interface PhaseProgressSummary {
  phase: ApplicationPhase;
  totalStages: number;
  completedStages: number;
  inProgressStages: number;
  notStartedStages: number;
  pendingReviewStages: number;
  progressPercentage: number; // 0-100
  nextStage?: ApplicationStage;
}
```

---

## Usage Examples

### Frontend: Update Stage Status

```typescript
import { UpdateStageStatusRequest, UpdateStageStatusResponse } from '@/types/application-stages';

async function markStageCompleted(stageId: string): Promise<UpdateStageStatusResponse> {
  const requestBody: UpdateStageStatusRequest = {
    status: 'completed'
  };

  const response = await fetch(`/api/v1/profile/applications/stages/${stageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error('Failed to update stage status');
  }

  return response.json();
}
```

### Frontend: Display Stage Progress

```typescript
import { ApplicationStageWithProgress, ApplicationStageStatus } from '@/types/application-stages';

function getStatusColor(status: ApplicationStageStatus): string {
  switch (status) {
    case 'completed':
      return 'green';
    case 'in_progress':
      return 'blue';
    case 'pending_review':
      return 'yellow';
    case 'not_started':
      return 'gray';
    default:
      return 'gray';
  }
}

function StageCard({ stage }: { stage: ApplicationStageWithProgress }) {
  return (
    <div className={`stage-card ${getStatusColor(stage.status)}`}>
      <h3>{stage.title}</h3>
      <p>{stage.description}</p>
      <span className="status">{stage.status.replace('_', ' ')}</span>
      {stage.completedAt && (
        <p className="completed-date">
          Completed: {new Date(stage.completedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}
```

---

## Database Migration Notes

If migrating from a different database schema, ensure:

1. Add `pending_review` to the status enum
2. Create indexes on `userId`, `stageId`, and compound `(userId, stageId)`
3. Set default values: `status = 'not_started'`, `completedAt = null`
4. Ensure timestamps are automatically managed

---

## API Integration Checklist

- [ ] Add types to content-types repository
- [ ] Update API documentation with new endpoint
- [ ] Test status transitions (not_started → in_progress → pending_review → completed)
- [ ] Verify completedAt timestamp is set/cleared correctly
- [ ] Test error responses (400, 401, 404)
- [ ] Implement frontend UI for stage status updates
- [ ] Add progress tracking visualization
- [ ] Set up notifications for status changes (optional)

---
