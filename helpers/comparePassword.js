import bcrypt from "bcrypt";

export const comparePassword = async (password, hashedPassword) => {
    //console.log(bcrypt.hashSync("perroloco",10));
    const test = await bcrypt.compare(password, hashedPassword)
    return test;
};