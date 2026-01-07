/// <reference types="vite/client" />
import { ImportMetaEnv as MyEnv } from './types';

// This augments the existing Vite types with your custom variables
interface ImportMetaEnv extends MyEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}