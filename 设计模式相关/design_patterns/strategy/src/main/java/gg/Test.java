package gg;

import org.omg.Messaging.SyncScopeHelper;

public class Test {
    public static void main(String[] args) {
        Duck duck = new ADuck();
        duck.setFlyBehavior(new NoFlyBehavior());
        duck.display();
        duck.fly();

        duck = new BDuck();
        duck.setFlyBehavior(new HasFlyBehavior());
        duck.display();
        duck.fly();
    }
}
