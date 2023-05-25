package org.example;

import java.io.*;
import java.util.*;

import static java.lang.Double.*;

public class Solver {

    private BufferedReader reader;
    private final LinkedList<LinkedList<Double>> matrix = new LinkedList<>();
    private LinkedList<LinkedList<Double>> saveMatrix = new LinkedList<>();
    private LinkedList<Double> oldAnswer = new LinkedList<>();
    private LinkedList<Double> currAnswer = new LinkedList<>();
    private int size;
    private double eps;
    private int currentIteration;

    public void solve() {

        initialize();

        setMaxDiagonal();

        calculate();

        if (!testList(currAnswer)) {
            System.out.println("This matrix can not be calculate");
            return;
        }

        output();
    }

    private void initialize() {
        System.out.print("""
                Please, choose:
                 0: input by keyboard
                 1: input by file
                """);

        reader = new BufferedReader(new InputStreamReader(System.in));

        try {
            while (true) {
                String input = reader.readLine();
                switch (input) {
                    case "0" -> {
                        System.out.println("Enter size and precision:");
                        input(false);
                        return;
                    }
                    case "1" -> {
                        fileInput();
                        return;
                    }
                    default -> System.out.println("Please, write only 0 or 1");
                }
            }
        } catch (IOException e) {
            e.getStackTrace();
        }
    }

    private void input(Boolean isFile) throws IOException {
        String[] line = reader.readLine().split(" ");
        size = Integer.parseInt(line[0]);
        eps = Double.parseDouble(line[1]);

        if (!isFile) {
            System.out.println("Your matrix:");
        }

        for (int row = 0; row < size; row++) {
            line = reader.readLine().split(" ");
            LinkedList<Double> tempList = new LinkedList<>();
            Arrays.stream(line).mapToDouble(Double::parseDouble).forEach(tempList::add);

            matrix.add(tempList);
            System.out.println(tempList);
        }

        saveMatrix = new LinkedList<>(matrix);
    }

    private void fileInput() throws IOException {
        System.out.println("File's name:");
        while (true) {
            try {
                String input = reader.readLine();
                reader = new BufferedReader(new FileReader("src/main/resources/" + input + ".txt"));
                break;
            } catch (FileNotFoundException e) {
                System.out.println("This file does not exist");
            }
        }

        input(true);
    }

    private void setMaxDiagonal() {

        if (size == 1) {
            return;
        }
        boolean isDiagonal = true;
        for (int column = 0; column < size; column++) {
            for (int row = 0; row < size; row++) {
                if (matrix.get(column).get(column) < matrix.get(row).get(column)) {
                    isDiagonal = false;
                }
            }
        }

        if (isDiagonal) {
            System.out.println("Matrix already in diagonal mode");
            return;
        }

        int maxRow = 0;
        Double maxVal = 0.0;
        Double sndMaxVal = 0.0;
        LinkedList<Integer> shake = new LinkedList<>();

        for (int column = 0; column < size; column++) {
            LinkedList<Double> tempList = new LinkedList<>();

            if (matrix.get(0).get(column) > matrix.get(1).get(column)) {
                maxVal = matrix.get(0).get(column);
                sndMaxVal = matrix.get(1).get(column);
                maxRow = 0;
            } else {
                maxVal = matrix.get(1).get(column);
                sndMaxVal = matrix.get(0).get(column);
                maxRow = 1;
            }

            for (int row = 2; row < size; row++) {
                if (matrix.get(row).get(column) > maxVal) {
                    sndMaxVal = maxVal;
                    maxVal = matrix.get(row).get(column);
                    maxRow = row;
                } else if (matrix.get(row).get(column) > sndMaxVal) {
                    sndMaxVal = matrix.get(row).get(column);
                }
            }
            shake.add(maxRow);
            double divide = sndMaxVal / maxVal * 1.1;
            for (int tempColumn = 0; tempColumn < size + 1; tempColumn++) {
                tempList.add(matrix.get(maxRow).get(tempColumn) * divide);
            }
            matrix.set(maxRow, tempList);
        }

        Set<Integer> set = new HashSet<>(shake);
        if (set.size() != shake.size()) {
        } else {
            LinkedList<Double> tempList;
            for (int row = 0; row < shake.size(); row++) {
                int currRow = shake.get(row);
                if (currRow != -1) {
                    tempList = new LinkedList<>(matrix.get(currRow));
                    matrix.set(currRow, new LinkedList<>(matrix.get(row)));
                    matrix.set(row, new LinkedList<>(tempList));
                    for (int i = 0; i < shake.size(); i++) {
                        if (shake.get(i) == row) {
                            shake.set(i, -1);
                        }
                    }
                }
            }
        }

        System.out.println("Mutated matrix:");

        for (LinkedList<Double> row : matrix) {
            System.out.println(row);
        }
    }

    private void calculate() {
        for (int row = 0; row < size; row++) {
            LinkedList<Double> tempRow = matrix.get(row);
            Double div = tempRow.get(row);
            oldAnswer.add(tempRow.pollLast() / div);
            for (int elem = 0; elem < size; elem++) {
                if (elem != row) {
                    tempRow.set(elem, -tempRow.get(elem) / div);
                } else {
                    tempRow.set(elem, 0.0);
                }
            }
        }

        LinkedList<Double> baseAnswers = new LinkedList<>(oldAnswer);
        currAnswer = new LinkedList<>(oldAnswer);

        int MAX_CALLS = 10000;
        while (currentIteration < MAX_CALLS &&
                (Math.abs(Collections.max(oldAnswer) - Collections.max(currAnswer)) > eps || currentIteration == 0) &&
                testList(currAnswer)) {
            oldAnswer = new LinkedList<>(currAnswer);
            for (int row = 0; row < size; row++) {
                double sum = 0;
                for (int elem = 0; elem < size; elem++) {
                    sum += matrix.get(row).get(elem) * oldAnswer.get(elem);
                }
                currAnswer.set(row, sum + baseAnswers.get(row));
            }
            currentIteration++;
        }
    }

    private void output() {
        System.out.print("""
                Please, choose:
                 0: output to console
                 1: output to file
                """);

        reader = new BufferedReader(new InputStreamReader(System.in));

        try {
            while (true) {
                String input = reader.readLine();
                switch (input) {
                    case "0" -> {
                        System.out.println("iterations: " + currentIteration);
                        System.out.println("solves: " + currAnswer);
                        System.out.println("approximate vector: " + Math.abs(Collections.max(oldAnswer) - Collections.max(currAnswer)));
                        System.out.println("Difference: ");

                        for (int row = 0; row < size; row++) {
                            Double sum = 0.0;
                            for (int column = 0; column < size; column++) {
                                sum += saveMatrix.get(row).get(column) * currAnswer.get(column);
                            }
                            System.out.print(" ");
                            System.out.println(saveMatrix.get(row).get(size) - sum);
                        }
                        return;
                    }
                    case "1" -> {
                        BufferedWriter writer = new BufferedWriter(new FileWriter("src/main/resources/output.txt"));
                        writer.write("iterations: " + currentIteration + "\n");
                        writer.append("solves: ").append(String.valueOf(currAnswer)).append("\napproximate vector: ").append(String.valueOf(Math.abs(Collections.max(oldAnswer) - Collections.max(currAnswer)))).append("\nDifference:\n");
                        for (int row = 0; row < size; row++) {
                            Double sum = 0.0;
                            for (int column = 0; column < size; column++) {
                                sum += saveMatrix.get(row).get(column) * currAnswer.get(column);
                            }
                            writer.append(" ").append(String.valueOf((saveMatrix.get(row).get(size) - sum))).append("\n");
                        }
                        writer.close();
                        return;
                    }
                    default -> System.out.println("Please, write only 0 or 1");
                }
            }
        } catch (IOException e) {
            e.getStackTrace();
        }
    }

    private Boolean testList(LinkedList<Double> list) {
        for (Double elem : list) {
            if (isInfinite(elem) || isNaN(elem)) {
                return false;
            }
        }
        return true;
    }
}
