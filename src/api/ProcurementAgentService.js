import axios from "axios";
import { API_URL } from '../Constants.js';

class ProcurementAgentService {

    addProcurementAgent(json) {
        //console.log(json);
        return axios.post(`${API_URL}/api/procurementAgent/`, json, {}
        );
    }

    getProcurementAgentListAll() {
        return axios.get(`${API_URL}/api/procurementAgent/`, {
        });
    }
    updateProcurementAgent(json) {
        return axios.put(`${API_URL}/api/procurementAgent/`, json, {
        });
    }

}

export default new ProcurementAgentService();