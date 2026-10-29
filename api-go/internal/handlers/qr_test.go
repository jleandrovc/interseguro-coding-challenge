package handlers

import (
	"math"
	"testing"
)

func TestValidateMatrix(t *testing.T) {
	tests := []struct {
		name string
		in   [][]float64
		want bool
	}{
		{"valid", [][]float64{{1, 2}, {3, 4}}, true},
		{"empty", nil, false},
		{"ragged", [][]float64{{1, 2}, {3}}, false},
		{"wide", [][]float64{{1, 2, 3}, {4, 5, 6}}, false},
		{"infinite", [][]float64{{1}, {math.Inf(1)}}, false},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validateMatrix(tt.in)
			if (err == nil) != tt.want {
				t.Fatalf("validateMatrix() error = %v, want valid %v", err, tt.want)
			}
		})
	}
}

func TestFactorizeDimensions(t *testing.T) {
	input := [][]float64{{1, 2}, {3, 4}, {5, 6}}
	q, r, err := factorize(input)
	if err != nil {
		t.Fatal(err)
	}
	if len(q) != 3 || len(q[0]) != 2 {
		t.Fatalf("Q dimensions incorrect: %dx%d", len(q), len(q[0]))
	}
	if len(r) != 2 || len(r[0]) != 2 {
		t.Fatalf("R dimensions incorrect: %dx%d", len(r), len(r[0]))
	}
	// Verify Q*R reconstructs A within floating-point tolerance.
	for i := range input {
		for j := range input[0] {
			var sum float64
			for k := range r {
				sum += q[i][k] * r[k][j]
			}
			if math.Abs(sum-input[i][j]) > 1e-8 {
				t.Fatalf("reconstruction mismatch at (%d,%d): got %g want %g", i, j, sum, input[i][j])
			}
		}
	}
}
