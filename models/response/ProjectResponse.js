class ProjectResponse {
    constructor(project) {
        this.id = project.id;
        this.title = project.title;
        this.description = project.description;
        this.link = project.link;
        this.idCategory = project.idcategory;
        this.categoryName = project.categoryname;
        this.image = project.image;
        this.top = project.top;
    }
}

module.exports = ProjectResponse;
