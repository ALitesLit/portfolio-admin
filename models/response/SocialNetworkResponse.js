class SocialNetworkResponse {
    constructor(social) {
        this.id = social.id;
        this.name = social.name;
        this.link = social.link;
        this.image = social.image;
    }
}

module.exports = SocialNetworkResponse;
