package gg;

import org.omg.Messaging.SyncScopeHelper;

public class Test {
    public static void main(String[] args) {
        BasePC basePC = new HuaweiPC();
        System.out.println(basePC.cost());
        System.out.println(basePC.getDescript());

        basePC = new JinsiduanMemoryDecorator(basePC);
        System.out.println(basePC.cost());
        System.out.println(basePC.getDescript());

        basePC = new AMDGPUDecorator(basePC);
        System.out.println(basePC.cost());
        System.out.println(basePC.getDescript());
    }
}
