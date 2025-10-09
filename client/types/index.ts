// Re-export all types from specific modules
export * from './navigation';
export * from './chat';
export * from './document';

// Common interface for tab screens
export interface TabScreenProps {
  navigation: any;
  route: any;
}