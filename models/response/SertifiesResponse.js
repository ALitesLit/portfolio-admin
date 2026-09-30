class SertifiesResponse {
    constructor(sertifies) {
        this.id = sertifies.id;
        this.title = sertifies.title;
        this.imageFront = sertifies.imagefront;
        this.imageBack = sertifies.imageback;
    }
}

module.exports = SertifiesResponse;
