// main function:
//  - download a git repository
//  - extract the repository
//  - return the path to the repository
import { execa } from "execa";

const clone = async (url: string, dest: string) => {
    await execa("git", ["clone", url, dest]);
    return dest;
};

export default clone;