module.exports = {
    index(req, res){
        const {movie, actor} = req.body;

        return res.json({movie})
    }
}