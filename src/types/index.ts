import * as vscode from "vscode";

export interface PrismaField {
  name: string;
  type: string;
  isArray: boolean;
  isId: boolean;
  isRequired: boolean;
  isRelation: boolean;
  relationModel?: string;
  defaultValue?: string;
}

export interface PrismaModel {
  name: string;
  fields: PrismaField[];
  relations: PrismaField[];
}

export interface ModelQuickPickItem extends vscode.QuickPickItem {
  model: PrismaModel;
}

export interface Feature {
  label: string;
  value: string;
  picked?: boolean;
  description?: string;
}
