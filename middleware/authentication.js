import jwt from "jsonwebtoken";
export const authentication = (req,res,next) =>{
    try{
    if(!req.headers["authorization"]){
        res.status(401).send({
            status:false,
            msg:"Auth token is required.",
            data:{}
        })
        return;
    }
    var token = req.headers["authorization"].replace("Bearer ",'');
    var checkToken = jwt.verify(token,"Coachinge")
    if(checkToken){
       next();
       return;
    }else{
        res.status(401).send({
            status:false,
            msg:"Auth token is not valid.",
            data:{}
        })
        return;
    }
} catch(err){
    res.status(401).send({
        status:false,
        msg:"Invalid token",
        data:{}
    })
    return;
}
}