class SkillsResponse {
    constructor(skills) {
        this.id = skills.id;
        this.name = skills.name;
        this.level = skills.level;
    }
}

module.exports = SkillsResponse;
