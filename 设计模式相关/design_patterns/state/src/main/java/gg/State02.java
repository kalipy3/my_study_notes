package gg;

public class State02 implements State {
    private GameMachine2 gameMachine;

    public State02(GameMachine2 gameMachine) {
        this.gameMachine = gameMachine;
    }

    @Override
    public void insertQuart() {
        gameMachine.setState(gameMachine.getState02());
    }
}
