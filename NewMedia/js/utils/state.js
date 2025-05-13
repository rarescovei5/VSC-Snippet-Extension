import { stateService } from '../services/state.service.js';
export const redirectTo = (path) => {
  stateService.setCurrentPath(path);
};
