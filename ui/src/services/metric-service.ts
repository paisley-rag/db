import axios from "axios";
import { SeriesOptionsType } from 'highcharts';
import { AXIOS_CONFIG, baseUrl } from '../lib/utils.ts';

import { chatbotService } from './chatbot-service';

import evalConfig from '../../../evals/eval_config.json';

type SeriesData = SeriesOptionsType & {
  type: string;
  name: string;
  data: number[][];
};


function seriesFromData(test_data: any[] = []): SeriesData[] {
  const scoreNames = evalConfig.scores;
    
  let series: SeriesData[] = scoreNames.map(name => ({
    type: 'line',
    name: name,
    data: []
  }));
  
  if (!test_data) {
    return series;
  }

  test_data.forEach((entry: any) => {
    let time_ms = new Date(entry.time).getTime();
    scoreNames.forEach((name, index) => {
      series[index].data.push([time_ms, entry[name]]);
    });
  });
  return series;
}

async function fetchChatbotMetrics(chatbotName: string | null) {
  
  let chatbots = await chatbotService.fetchChatbots()

  const chatbot = chatbots.find((chatbot: any) => chatbot.name === chatbotName); // change any later
  if (!chatbot) {
    return seriesFromData();
  }

  const response = await axios.get(`${baseUrl}/api/history`, AXIOS_CONFIG);
  let data = response.data

  data = data.filter((entry: any) => entry.chatbot_id === chatbot.id);

  return seriesFromData(data);
}

export const metricService = {
  fetchChatbotMetrics,
};
