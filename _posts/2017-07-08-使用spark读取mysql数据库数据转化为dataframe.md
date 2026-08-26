---
title: 使用spark读取mysql数据库数据转化为dataframe
date: 2017-07-08 20:32:20 +0800
categories:
- spark
tags:
- spark
- RDD
---
使用`spark`中的接口连接`mysql`数据库并读取并查询出数据库中的数据并转化为`spark`中的`dataframe`格式的`RDD`。其中实现了两种方式查询数据，一种单表查询和另外一种的多表关联查询数据。其中使用的方式在下面代码的`main`函数中。<!--more-->
```java
import org.apache.spark.SparkConf
import org.apache.spark.SparkContext
import org.apache.spark.sql.SQLContext

class sparkConnectMySQL(host: String, user: String, password: String) {
    private val conf = new SparkConf().setMaster("local").setAppName("connection")
    private val sc = new SparkContext(conf)
    private var port = "3306"
    private var database = "situation"

    def this(host: String, user: String, password: String, port:String) {
        this(host: String, user: String, password: String)
        this.port = port
    }
    
    def this(host: String, user: String, password: String, port:String, database:String) {
        this(host: String, user: String, password: String, port:String)
        this.database = database
    }
    
    assert(host.isInstanceOf[String], println("The host must be string type."))
    val jdbcURL = "jdbc:mysql://" + host + ":" + port + "/" + database  // ?user=root&password=root123
    val sqlContext = new SQLContext(sc)
    
    def query(tableName:String, sqlScript:String, registerTable:String): org.apache.spark.sql.DataFrame = {
        /**
          * THis method is query one table, default table name: temp, this is register temp table name.
          * tableName => The table's truth name in database.
          * sqlScript => mySQL script.
          * registerTable => create temp table name.
          */
        val execute = sqlContext.read.format("jdbc").options(Map("url" -> this.jdbcURL, "dbtable" -> tableName,
            "user" -> user, "password" -> password)).load()
    
        execute.registerTempTable(registerTable)
        execute.sqlContext.sql(sqlScript)  /* return DataFrame type class */
    }
    
    def queryMany(tableName:Array[String], sqlScript:String, registerTable:Array[String]): org.apache.spark.sql.DataFrame = {
        /**
          * THis method is query many table by join, default table name: temp, this is register temp table name.
          * tableName's size as same as registerTable size.
          * tableName => The table's truth name of array in database.
          * sqlScript => mySQL script.
          */
        val tableZipRegister = tableName.zip(registerTable)
        for ((name, temp) <- tableZipRegister) {
            val execute = sqlContext.read.format("jdbc").options(Map("url" -> this.jdbcURL, "dbtable" -> name,
                "user" -> user, "password" -> password)).load()
            execute.registerTempTable(temp)
        }
        sqlContext.sql(sqlScript)
    }
}

object sparkConnectTest{
    def main(args: Array[String]): Unit ={
        val scm = new sparkConnectMySQL(host = "10.4.5.125", user = "root", password = "root123")
    
        // use method example:
        val dataframe = scm.query(tableName = "BUG_ANALYZER_RESULT", sqlScript = "select * from TEMP1", registerTable = "TEMP1")
        val frame = scm.queryMany(tableName = Array("GUARD_VIRUS_SCAN", "GUARD_VIRUS_SCAN"),
                                  sqlScript = "select a.scan_id,a.imei, b.app_name from temp1 a, temp2 b where a.scan_id = b.scan_id ",
                                  registerTable=Array("temp1", "temp2"))
    
        dataframe.collect().take(10).foreach(println)
        frame.collect().take(10).foreach(println)
    }
}
```
