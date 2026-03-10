import api from "./api";

export default class SchemaService {
    async getSchemaByDatabaseId(id: number) {
        const response = await api.get(`/schema/${id}/schema`);
        return response.data;
    }

    async parseSchema(sql: string) {
        const response = await api.post(`/schema/parse`, { sql });
        return response.data;
    }
}
