package gg;

public class State01 implements State {
    private GameMachine2 gameMachine;

    public State01(GameMachine2 gameMachine) {
        this.gameMachine = gameMachine;
    }

    @Override
    public void insertQuart() {
        gameMachine.setState(gameMachine.getState01());
    }
}
