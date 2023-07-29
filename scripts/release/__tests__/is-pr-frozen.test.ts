/* eslint-disable no-underscore-dangle */
/* eslint-disable global-require */
import path from 'path';
import { run as isPrFrozen } from '../is-pr-frozen';

// eslint-disable-next-line jest/no-mocks-import
jest.mock('node:fs/promises', () => require('../../../code/__mocks__/fs-promises'));
jest.mock('../utils/get-github-info');

const fsPromises = require('node:fs/promises');
const simpleGit = require('simple-git');
const { getPullInfoFromCommit } = require('../utils/get-github-info');

const CODE_DIR_PATH = path.join(__dirname, '..', '..', '..', 'code');
const CODE_PACKAGE_JSON_PATH = path.join(CODE_DIR_PATH, 'package.json');

fsPromises.__setMockFiles({
  [CODE_PACKAGE_JSON_PATH]: JSON.stringify({ version: '1.0.0' }),
});

describe('isPrFrozen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when PR is frozen', async () => {
    getPullInfoFromCommit.mockResolvedValue({
      labels: ['freeze'],
    });
    await expect(isPrFrozen({ patch: false })).resolves.toBe(true);
  });

  it('should return false when PR is not frozen', async () => {
    getPullInfoFromCommit.mockResolvedValue({
      labels: [],
    });
    await expect(isPrFrozen({ patch: false })).resolves.toBe(false);
  });

  it('should look for patch PRs when patch is true', async () => {
    getPullInfoFromCommit.mockResolvedValue({
      labels: [],
    });
    await isPrFrozen({ patch: true });

    expect(simpleGit.__fetch).toHaveBeenCalledWith('origin', 'version-patch-from-1.0.0', {
      '--depth': 1,
    });
  });

  it('should look for prerelease PRs when patch is false', async () => {
    getPullInfoFromCommit.mockResolvedValue({
      labels: [],
    });
    await isPrFrozen({ patch: false });

    expect(simpleGit.__fetch).toHaveBeenCalledWith('origin', 'version-prerelease-from-1.0.0', {
      '--depth': 1,
    });
  });
});
