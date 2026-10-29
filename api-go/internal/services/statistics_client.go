package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

type Statistics struct {
	Max      float64 `json:"max"`
	Min      float64 `json:"min"`
	Sum      float64 `json:"sum"`
	Average  float64 `json:"average"`
	Diagonal struct {
		Q   bool `json:"q"`
		R   bool `json:"r"`
		Any bool `json:"any"`
	} `json:"diagonal"`
}

type StatisticsClient struct {
	url    string
	client *http.Client
}

func NewStatisticsClient(url string, timeout time.Duration) *StatisticsClient {
	return &StatisticsClient{
		url: url,
		client: &http.Client{Timeout: timeout},
	}
}

func (c *StatisticsClient) Calculate(q, r [][]float64) (Statistics, error) {
	payload, err := json.Marshal(map[string][][]float64{"q": q, "r": r})
	if err != nil {
		return Statistics{}, fmt.Errorf("encode statistics request: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, c.url, bytes.NewReader(payload))
	if err != nil {
		return Statistics{}, fmt.Errorf("create statistics request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	res, err := c.client.Do(req)
	if err != nil {
		return Statistics{}, err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return Statistics{}, fmt.Errorf("statistics service returned HTTP %d", res.StatusCode)
	}
	var result Statistics
	if err := json.NewDecoder(res.Body).Decode(&result); err != nil {
		return Statistics{}, fmt.Errorf("decode statistics response: %w", err)
	}
	return result, nil
}
