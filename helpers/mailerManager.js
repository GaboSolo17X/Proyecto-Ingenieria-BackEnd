import mailer from "../config/confMailer.js";

export const  enviarCorreo = async (info) => {
    //funcion para elementos generico de envio de correo
    try {
      const mailOptions = {
        from: `${info.from}` + "<" + process.env.EMAIL_USER + "@gmail.com" + ">",
        to: `${info.correo}`,
        subject: info.asunto,
        Text: info.texto,
        html: info.html,
      };
    
      await mailer.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
    }
  }

