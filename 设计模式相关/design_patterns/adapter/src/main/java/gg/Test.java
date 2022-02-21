package gg;

import org.omg.Messaging.SyncScopeHelper;

public class Test {
    public static void main(String[] args) {
        Duck duck = new ADuck();
        duck.fly();
        duck.guagua();

        duck = new TurkeyAdapter(new ATurkey());
        duck.guagua();
        duck.fly();
    }
}
