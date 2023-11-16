import { estudiante } from "../models/estudianteModel.js";
import jwt from "jsonwebtoken";
import { generateJWT, generateRefreshJWT } from "../helpers/tokenManager.js";
import { comparePassword } from "../helpers/comparePassword.js";
import bcrypt from "bcrypt";

// correoPersonal , claveEstudiante

export const loginEstudiante = async (req, res) => {
  try {
    const { numeroCuenta, claveEstudiante } = req.body;
    let estudianteLogin = await estudiante.findOne({
      where: { numeroCuenta: numeroCuenta },
    });
    const hashedPassword = estudianteLogin.claveEstudiante;
    if (!estudianteLogin) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }
    const respuestaPassword = await comparePassword(
      claveEstudiante,
      hashedPassword
    );
    if (!respuestaPassword) {
      return res.status(400).json({ message: "Credenciales Incorrectas" });
    }

    const { token, expiresIn } = generateJWT(estudianteLogin.numeroCuenta);
    generateRefreshJWT(estudianteLogin.numeroCuenta, res);

    return res
      .status(200)
      .json({ message: "Login exitoso", token, expiresIn, estudianteLogin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
//...

export const getEstudiantes = async (req, res) => {
  try {
    if ((await estudiante.count()) === 0) {
      return res
        .status(400)
        .json({ message: "No hay estudiantes registrados" });
    }
    return res.status(200).json(await estudiante.findAll());
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

export const getEstudianteByCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const estudianteEspecifico = await estudiante.findOne({
      where: { numeroCuenta: id },
    });
    if (!estudianteEspecifico) {
      return res.status(400).json({ message: "El estudiante no existe" });
    }
    return res.status(200).json(estudianteEspecifico);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};


export const actualizarCarreraEstudiante = async (req, res) => {
  try{
    const { numeroCuenta, carrera } = req.body;
    console.log(numeroCuenta);
    console.log(carrera);
    await estudiante.update(
      { carrera: carrera  , carreraSecundaria: null},
      { where: { numeroCuenta: numeroCuenta } }
    );
    return res.status(200).json({ message: "Carrera actualizada con éxito" });

  }catch(error){
    console.log(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};



// export const recuperarClaveEstudiante = async (req, res) => {
//   try {
//     const { correoPersonal } = req.body;
//     const estudianteEspecifico = await estudiante.findOne({
//       where: { correoPersonal: correoPersonal },
//     });
//     if (!estudianteEspecifico) {
//       return res.status(400).json({ message: "El estudiante no existe" });
//     }
//     return res.status(200).json(estudianteEspecifico);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Error en el servidor" });
//   }
// };

// export const cambiarClaveEstudiante = async (req, res) => {
//     try {
//         const { numeroCuenta } = req.body;
//         const estudianteEspecifico = await estudiante.findOne({
//             where: { numeroCuenta: numeroCuenta },
//         });
//         if (!estudianteEspecifico) {
//             return res.status(400).json({ message: "El estudiante no existe" });
//         }
//         const claveNuevaEstudiante = 
//         estudianteEspecifico.centroRegional.slice(-2) +
//         estudianteEspecifico.nombres.slice(0, 1) +
//         (Math.floor(Math.random() * 99) + 1).toString().padStart(2, "0") +
//         estudianteEspecifico.identidad.slice(-2);

//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(claveNuevaEstudiante, salt);
//         await estudiante.update(
//             { claveEstudiante: hashedPassword },
//             { where: { numeroCuenta: numeroCuenta } }
//         );

//         // Enviar un correo con la nueva clave



//         return res.status(200).json({ message: "Clave cambiada con éxito", claveNuevaEstudiante });
        
//     } catch (error) {

//         console.log(error);
        
//     }
// };


