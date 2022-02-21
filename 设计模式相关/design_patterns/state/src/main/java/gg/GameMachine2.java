package gg;

public class GameMachine2 {
    private State state01 = new State01(this);
    private State state02 = new State02(this);

    public State state;
    private int cnt = 0;

    public void setState(State state) {
        this.state = state;
    }

    public State getState01() {
        return state01;
    }

    public State getState02() {
        return state02;
    }
    public GameMachine2(int cnt) {
        this.cnt = cnt;

        if (cnt > 0) {
            this.state = state01;
        }
    }

    public void insertQuart() {
        state.insertQuart();
    }
}
