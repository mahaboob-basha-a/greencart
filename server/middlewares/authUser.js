import jwt from "jsonwebtoken";

const authUser = async (req,res,next)=>{
    const {token} = req.cookies;
    if(!token){
        return res.status(401).json({success: false, message: "Not Authorized"});
    }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET)
        if(tokenDecode.id){
            const id = tokenDecode.id
            if (!req.body) { 
                req.body = {};
              }
            req.body.userId = id;
            next()
        }else{
            return res.status(401).json({success: false, message: "Not Authorized"});
        }
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

export default authUser;