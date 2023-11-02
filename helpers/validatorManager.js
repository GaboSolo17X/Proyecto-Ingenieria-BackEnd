import { body , validationResult} from "express-validator";

export const validationResultExpress = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
};

export const bodyRegisterValidator = [
    body("identidad").trim().notEmpty().withMessage('la identidad es requerida'),validationResultExpress,
    body("nombres").trim().notEmpty().withMessage("El nombre es requerido"),validationResultExpress,
    body("apellidos").trim().notEmpty().withMessage("El apellido es requerido"),validationResultExpress,
    body("carreraPrincipal").trim().notEmpty().withMessage("La carrera principal es requerida"),validationResultExpress,
    body("carreraSecundaria").trim().notEmpty().withMessage("La carrera secundaria es requerida"),validationResultExpress,
    body("correoPersonal").trim().isEmail().normalizeEmail().notEmpty().withMessage("El correo personal es requerido"),validationResultExpress,
    body("centroRegional").trim().isIn(["UNAH-CU", "UNAH-VS", "CURLA"]).withMessage("Centro Regional no válido"),validationResultExpress,
    body("telefono").trim().notEmpty().withMessage("El teléfono es requerido"),validationResultExpress,
];

