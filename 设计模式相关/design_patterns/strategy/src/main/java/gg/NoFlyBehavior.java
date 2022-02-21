package gg;

import org.omg.Messaging.SyncScopeHelper;

public class NoFlyBehavior implements FlyBehavior {

    @Override
    public void fly() {
        System.out.println("no fly..");
    }
}
