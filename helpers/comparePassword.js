import bcrypt from "bcrypt";

export const comparePassword = async (password, hashedPassword) => {
    //console.log(bcrypt.hashSync("perroloco",10));
    //console.log(password, hashedPassword);
    const test = await bcrypt.compare(password, hashedPassword)
    console.log(password, hashedPassword);
    console.log(test," aqui es en comparePassword");
    return test;
};