import javax.swing.JProgressBar;

public class SFTROUCLI {
    public static void main(String[] args) {
        try {
            GraphSolver.convert(args[0], "output.thr", "output.png", true, new JProgressBar(0, 100));
        } catch (Throwable exception) {
            System.out.println(exception.getMessage());
        }
    }
}