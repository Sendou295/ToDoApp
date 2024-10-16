//IToDoWpProps.ts

import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IToDoWpProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  context: WebPartContext;
}