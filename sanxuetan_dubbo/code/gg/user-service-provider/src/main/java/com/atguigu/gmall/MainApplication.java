package com.atguigu.gmall;

import java.io.IOException;

import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

public class MainApplication {
	
	public static void main(String[] args) throws Exception {
		ClassPathXmlApplicationContext ioc = new ClassPathXmlApplicationContext("provider.xml");
		ioc.start();
		
		//System.in.read();//防止退出
        Thread.sleep(60*1000*10);
	}

}
