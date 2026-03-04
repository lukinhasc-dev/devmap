import db from "../database/connection";

type CountResult = { total: number };

export class DashboardService {

    getDashboardStats() {
        return {
            endpointsStats: this.getEndpointsStats(),
            projectsStats: this.getProjectsStats(),
            githubStats: this.getGithubStats(),
            databaseStats: this.getDatabaseStats()
        };
    }

    getEndpointsStats() {
        const endpointsTotal = db.prepare("SELECT COUNT(*) as total FROM endpoints").get() as CountResult;
        const endpointGet = db.prepare("SELECT COUNT(*) as total FROM endpoints WHERE rota = 'GET'").get() as CountResult;
        const endpointPost = db.prepare("SELECT COUNT(*) as total FROM endpoints WHERE rota = 'POST'").get() as CountResult;
        const endpointPut = db.prepare("SELECT COUNT(*) as total FROM endpoints WHERE rota = 'PUT'").get() as CountResult;
        const endpointDelete = db.prepare("SELECT COUNT(*) as total FROM endpoints WHERE rota = 'DELETE'").get() as CountResult;

        return {
            total: endpointsTotal.total,
            get: endpointGet.total,
            post: endpointPost.total,
            put: endpointPut.total,
            delete: endpointDelete.total
        };
    }

    getProjectsStats() {
        const projectsTotal = db.prepare("SELECT COUNT(*) as total FROM projects").get() as CountResult;
        const projectsAndamento = db.prepare("SELECT COUNT(*) as total FROM projects WHERE status = 'Em Andamento'").get() as CountResult;
        const projectsConcluido = db.prepare("SELECT COUNT(*) as total FROM projects WHERE status = 'Concluído'").get() as CountResult;
        const projectsPausados = db.prepare("SELECT COUNT(*) as total FROM projects WHERE status = 'Pausados'").get() as CountResult;

        return {
            total: projectsTotal.total,
            andamento: projectsAndamento.total,
            concluido: projectsConcluido.total,
            pausados: projectsPausados.total
        };
    }

    getGithubStats() {
        const githubTotal = db.prepare("SELECT COUNT(*) as total FROM github").get() as CountResult;

        return {
            total: githubTotal.total
        };
    }

    getDatabaseStats() {
        const databaseTotal = db.prepare("SELECT COUNT(*) as total FROM database").get() as CountResult;

        return {
            total: databaseTotal.total
        };
    }
}