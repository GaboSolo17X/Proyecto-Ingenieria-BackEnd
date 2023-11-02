import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        cb(null, Date.now()+"-"+file.originalname)
    }
});

const upload = multer({ storage:storage });

export const subir = upload.single("usrfile");

export const subirArchivo = async (req, res) => {
    try {
        return res.status(200).json({ message: "Archivo subido" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
    
};